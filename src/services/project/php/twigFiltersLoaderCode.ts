export default `
function getDoc($reflectionMethod)
{
    $docComment = $reflectionMethod->getDocComment();
    if (!$docComment) {
        return '';
    }

    $rows = [];

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

        $rows[] = $row;
    }

    return implode("\\n\\n", $rows);
}

function getDefaultFilters()
{
    $twigFilters = [];

    foreach (app('twig.environment')->getFilters() as $filter) {
        $callable = $filter->getCallable();

        $name = $filter->getName();
        $params = [];
        $doc = '';

        if (Str::endsWith($name, '_*')) {
            continue;
        }

        $funcParams = [];

        if ($callable instanceof Closure || is_string($callable)) {
            $ref = new ReflectionFunction($callable);
            $funcParams = $ref->getParameters();
            $doc = getDoc($ref);
        }

        if (is_array($callable)) {
            $obj = Arr::get($callable, 0);
            $method = Arr::get($callable, 1);

            if (is_object($obj) && method_exists($obj, $method)) {
                $ref = new ReflectionMethod($obj, $method);
                $funcParams = $ref->getParameters();
                $doc = getDoc($ref);
            }
        }

        if (!empty($funcParams)) {
            if ($funcParams[0]->name === 'env') {
                array_shift($funcParams);
            }
        }

        array_shift($funcParams);

        $i = 1;
        foreach ($funcParams as $param) {
            $params[] = '\${' . $i++ . ':' . Str::snake($param->name) . '}';
        }

        $twigFilters[$name] = [
            'name' => $name,
            'snippet' => $name . (count($params) ? ('(' . implode(', ', $params) . ')') : ''),
            'doc' => $doc,
        ];
    }

    return $twigFilters;
}

function getFilters($className, $prefix)
{
    $class = new ReflectionClass($className);
    $methods = $class->getMethods(ReflectionMethod::IS_PUBLIC);
    $skip = [
        'macro', 'mixin', 'hasMacro', 'flushMacros', 'getSessionStore', 'setSessionStore',
        'signedRoute', 'temporarySignedRoute', 'hasValidSignature', 'hasValidRelativeSignature', 'hasCorrectSignature', 'signatureHasNotExpired',
        'defaults', 'getDefaultParameters', 'formatParameters', 'formatHostUsing', 'formatPathUsing', 'pathFormatter',
        'getRequest', 'setRequest', 'setRoutes', 'setSessionResolver', 'setKeyResolver',
        'getRootControllerNamespace', 'setRootControllerNamespace',
    ];

    $twigFilters = [];
    foreach ($methods as $method) {
        if (Str::startsWith($method->name, '__') || in_array($method->name, $skip)) {
            continue;
        }

        $params = [];

        $funcParams = $method->getParameters();
        array_shift($funcParams);

        $i = 1;
        foreach ($funcParams as $param) {
            $params[] = '\${' . $i++ . ':' . Str::snake($param->name) . '}';
        }

        $name = $prefix . Str::snake($method->name);
        $doc = getDoc($method);
        $snippet = $name . '(' . implode(', ', $params) . ')';

        $twigFilters[$name] = [
            'name' => $name,
            'snippet' => $snippet,
            'doc' => $doc
        ];
    }
    return $twigFilters;
}

function getCustomTwigFilters()
{
    $twigFilters = [];

    foreach (System\\Classes\\PluginManager::instance()->getPlugins() as $code => $plugin) {
        $filters = Arr::get($plugin->registerMarkupTags(), 'filters', []);

        foreach ($filters as $name => $func) {
            $funcParams = [];

            if ($func instanceof Closure) {
                $ref = new ReflectionFunction($func);
                $funcParams = $ref->getParameters();
            }

            if (is_array($func)) {
                $obj = Arr::get($func, 0);
                $method = Arr::get($func, 1);

                if (is_object($obj) && method_exists($obj, $method)) {
                    $ref = new ReflectionMethod($obj, $method);
                    $funcParams = $ref->getParameters();
                }
            }

            array_shift($funcParams);

            $params = [];

            $i = 1;
            foreach ($funcParams as $param) {
                $params[] = '\${' . $i++ . ':' . Str::snake($param->name) . '}';
            }

            $twigFilters[$name] = [
                'name' => $name,
                'snippet' => $name . '(' . implode(', ', $params) . ')',
                'doc' => 'From: ' . $code
            ];
        }
    }

    return $twigFilters;
}

$pageAndTheme = [
    'page' => [
        'name' => 'page',
        'snippet' => 'page()',
        'doc' => 'Creates a link to a page using a page file name.'
    ],
    'theme' => [
        'name' => 'theme',
        'snippet' => 'theme',
        'doc' => 'Returns an address relative to the active theme path of the website.'
    ],
];

$filters = array_merge(
    getDefaultFilters(),
    getFilters(October\\Rain\\Html\\HtmlBuilder::class, 'html_'),
    getFilters(October\\Rain\\Support\\Str::class, 'str_'),
    getFilters(Illuminate\\Contracts\\Routing\\UrlGenerator::class, 'url_'),
    getCustomTwigFilters(),
    $pageAndTheme
);

echo json_encode($filters);
`;
