export default `
if (class_exists('System') && version_compare(\\System::VERSION, '3.0') !== -1) {
    echo json_encode(\\Backend\\Classes\\RoleManager::instance()->listPermissions());
} else {
    echo json_encode(\\Backend\\Classes\\AuthManager::instance()->listPermissions());
}
`;
