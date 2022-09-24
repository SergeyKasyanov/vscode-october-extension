export default `
$pluginsConfigs = [];
$plugins = \\System\\Classes\\PluginManager::instance()->getPlugins();
foreach (array_keys($plugins) as $code) {
    $pluginPath = str_replace('.', '/', strtolower($code));

    if (is_dir(plugins_path($pluginPath . '/config'))) {
        foreach (scandir(plugins_path($pluginPath . '/config')) as $file) {
            if (\\Illuminate\\Support\\Str::startsWith($file, '.')) {
                continue;
            }

            $data = require(plugins_path($pluginPath . '/config/' . $file));
            $prefix = $file !== 'config.php' ? (substr($file, 0, strlen($file) - 4) . '.') : '';

            foreach ($data as $key => $value) {
                $pluginsConfigs[strtolower($code) . '::' . $prefix . $key] = $value;
            }
        }
    }
}

echo json_encode(array_merge($pluginsConfigs, config()->all()));
`;
