export default `
$result = [];

foreach (\\System\\Classes\\PluginManager::instance()->getPlugins() as $code => $plugin) {
    $menu = [];

    $nav = $plugin->registerNavigation();

    if ($nav) {
        foreach ($plugin->registerNavigation() as $main => $details) {
            if (!isset($menu[$main])) {
                $menu[$main] = [];
            }

            if (!isset($details['sideMenu'])) {
                continue;
            }

            foreach (array_keys($details['sideMenu']) as $side) {
                $menu[$main][] = $side;
            }
        }
    }

    $result[$code] = [
        'menu' => $menu
    ];
}

echo json_encode($result);
`;
