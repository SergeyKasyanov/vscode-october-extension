export default `
$twigTests = [];

foreach (app('twig.environment')->getTests() as $test) {
    $name = $test->getName();
    $urlPart = str_replace(' ', '', $name);
    $doc = "[Documentation](https://twig.symfony.com/doc/3.x/tests/$urlPart.html)";

    $twigTests[$name] = [
        'name' => $name,
        'snippet' => $name,
        'doc' => $doc,
    ];

    $not = 'not ' . $name;

    $twigTests[$not] = [
        'name' => $not,
        'snippet' => $not,
        'doc' => $doc,
    ];
}

echo json_encode($twigTests);
`;
