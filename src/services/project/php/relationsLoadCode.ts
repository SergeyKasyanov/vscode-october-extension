export default function getCode(modelFqn: string) {
    return `
$modelClass = '${modelFqn}';
$relations = [];
try {
    $model = new $modelClass;
    $types = [
        'hasOne', 'hasMany',
        'belongsTo', 'belongsToMany',
        'morphTo', 'morphOne', 'morphMany',
        'attachOne', 'attachMany',
    ];
    foreach ($types as $type) {
        foreach ($model->{$type} as $name => $rel) {
            if ($type === 'morphTo') {
                $modelFqn = null;
            } else if (is_array($rel)) {
                $modelFqn = Arr::first($rel);
            } else {
                $modelFqn = $rel;
            }

            $relations[$name] = [
                'name' => $name,
                'type' => $type,
                'modelFqn' => $modelFqn ? '\\\\' . $modelFqn : null
            ];
        }
    }
    echo json_encode($relations);
} catch (Error $e) {
    echo json_encode($relations);
}
`;
}
