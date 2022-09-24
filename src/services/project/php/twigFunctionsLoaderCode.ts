export default `
function getDoc($reflectionMethod)
{
    $fqn = '@see \\\\' . $reflectionMethod->class . '::' . $reflectionMethod->name;

    $docComment = $reflectionMethod->getDocComment();
    if (!$docComment) {
        return $fqn;
    }

    $result = '';

    foreach (explode("\\n", $docComment) as $row) {
        $row = trim($row);

        if (in_array($row, ['/**', '*/'])) {
            continue;
        }

        $row = trim(substr($row, 1));
        if (empty($row)) {
            continue;
        }

        if (Str::startsWith($row, '@')) {
            $row = '_' . $row . '_';
        }

        $result .= $row . "\\n\\n";
    }

    return $result . $fqn;
}

function getDefaultTwigFunctions()
{
    $twigFunctions = [];

    $sources = [
        app('twig.environment'),
        new System\\Twig\\Extension(),
        new Cms\\Twig\\Extension(),
        new Cms\\Twig\\DebugExtension(),
        new Media\\Twig\\Extension(),
    ];

    $forbidden = ['extend', 'include', 'form_macro'];
    $documented = ['attribute', 'block', 'constant', 'cycle', 'date', 'dump', 'html_classes', 'include', 'max', 'min', 'parent', 'random', 'range', 'source', 'country_timezones', 'template_from_string'];

    foreach ($sources as $source) {
        $functions = $source->getFunctions();

        /** @var Twig\\TwigFunction $func */
        foreach ($functions as $name => $func) {
            $name = $func->getName();

            if (in_array($name, $forbidden) || Str::endsWith($name, '_*')) {
                continue;
            }

            $doc = in_array($name, $documented) ? "[Documentation](https://twig.symfony.com/doc/3.x/functions/$name.html)" : null;

            $callable = $func->getCallable();
            $funcParams = [];

            if ($callable instanceof Closure || is_string($callable)) {
                $ref = new ReflectionFunction($callable);
                $funcParams = $ref->getParameters();
            }

            if (is_array($callable)) {
                $obj = Arr::get($callable, 0);
                $method = Arr::get($callable, 1);

                if (is_object($obj) && method_exists($obj, $method)) {
                    $ref = new ReflectionMethod($obj, $method);
                    $funcParams = $ref->getParameters();
                    $doc = getDoc($ref) ?: $doc;
                }
            }

            $firstParam = Arr::first($funcParams);
            if ($firstParam && $firstParam->name === 'env') {
                array_shift($funcParams);
            }

            $params = [];

            $i = 1;
            foreach ($funcParams as $param) {
                $params[] = '\${' . $i++ . ':' . Str::snake($param->name) . '}';
            }

            $twigFunctions[$name] = [
                'name' => $name,
                'snippet' => $name . '(' . implode(', ', $params) . ')',
                'doc' => $doc,
            ];
        }
    }


    return $twigFunctions;
}

function getHelperFunctions($className, $prefix)
{
    $class = new ReflectionClass($className);
    $methods = $class->getMethods(ReflectionMethod::IS_PUBLIC);
    $skip = [
        'macro', 'mixin', 'hasMacro', 'flushMacros', 'getSessionStore', 'setSessionStore'
    ];

    $twigFunctions = [];
    foreach ($methods as $method) {
        if (Str::startsWith($method->name, '__') || in_array($method->name, $skip)) {
            continue;
        }

        $params = [];

        $i = 1;
        foreach ($method->getParameters() as $param) {
            $params[] = '\${' . $i++ . ':' . Str::snake($param->name) . '}';
        }

        $name = $prefix . Str::snake($method->name);
        $doc = getDoc($method);
        $snippet = $name . '(' . implode(', ', $params) . ')';

        $twigFunctions[$name] = [
            'name' => $name,
            'snippet' => $snippet,
            'doc' => $doc
        ];
    }
    return $twigFunctions;
}

$all = array_merge(
    getDefaultTwigFunctions(),
    getHelperFunctions(October\\Rain\\Html\\FormBuilder::class, 'form_'),
    getHelperFunctions(October\\Rain\\Html\\HtmlBuilder::class, 'html_'),
    getHelperFunctions(October\\Rain\\Support\\Str::class, 'str_')
);

echo json_encode($all);
`;
