export default function getCode(modelFqn: string) {
    return `
$columns = [];
$modelClass = '${modelFqn}';
if (class_exists($modelClass)) {
    try {
        $model = new $modelClass;
        $table = $model->getTable();
        $columnNames = Schema::getColumnListing($table);
        foreach ($columnNames as $col) {
            $type = Schema::getColumnType($table, $col);
            $columns[$col] = [
                'name' => $col,
                'type' => $type,
            ];
        }
    } catch (Error $e) {}
}
echo json_encode($columns);
`;
}
