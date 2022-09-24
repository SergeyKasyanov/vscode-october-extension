export default `
echo json_encode(collect(\\Cms\\Classes\\ComponentManager::instance()
    ->listComponentOwnerDetails())
    ->flatMap(function ($data, $fqn) {
        return collect($data['components'])
            ->mapWithKeys(function ($componentData, $name) use ($fqn) {
                if (strpos($fqn, 'Tailor') === 0) {
                    $plugin = 'Tailor';
                } elseif (strpos($fqn, 'Cms') === 0) {
                    $plugin = 'Cms';
                } elseif (strpos($fqn, 'Plugin') !== false) {
                    [$author, $pluginName] = explode('\\\\', $fqn);
                    $plugin = $author . '.' . $pluginName;
                } else {
                    $plugin = '';
                }
                $componentData['name'] = \\Lang::get($componentData['name']);
                if (!empty($componentData['description'])) {
                    $componentData['description'] = \\Lang::get($componentData['description']);
                }
                $componentData['plugin'] = $plugin;
                $componentData['props'] = (collect((new $componentData['className'])->defineProperties()))->mapWithKeys(function ($data, $name) {
                    return [$name => [
                        'name' => $name,
                        'title' => isset($data['title']) ? \\Lang::get($data['title']) : '',
                        'description' => isset($data['description']) ? \\Lang::get($data['description']) : '',
                    ]];
                });
                $ref = new ReflectionClass($componentData['className']);
                $componentData['ajaxMethods'] = (collect($ref->getMethods(ReflectionMethod::IS_PUBLIC))
                    ->filter(function (ReflectionMethod $meth) use ($ref) {
                        return $meth->getDeclaringClass()->getName() === $ref->getName()
                            && \Str::startsWith($meth->getName(), 'on')
                            && $meth->getName() !== 'onRun';
                    }))
                    ->map(function ($meth) {
                        return $meth->getName();
                    })
                    ->values()
                    ->all();
                return [$name => $componentData];
            });
    })
    ->all()
);
`;
