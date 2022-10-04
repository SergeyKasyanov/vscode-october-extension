export const regExps = {

    // snippets:
    // quote               [\'\"]
    // related filename    [\w\/\-.]+
    // random string       [а-я\w\-\.\,\:\;\!\?\s\'\"\(\)\\\[\]\{\}]+
    // directory separator [\/\\]
    // array start         (\[|array\()

    //
    // common
    //

    spaces: /^\s+$/,
    empty: /^$/,
    spacesOrEmpty: /^\s*$/,
    objectStartGlobal: /\{[^{%]/g,
    quotedAlphaString: /[\'\"][\w]+[\'\"]/,
    awaitsObjectValue: /^\w+([а-я\w\-\.\,\:\!\?\s\'\"\(\)\\\[\]\{\}]+):\s*$/,
    spacesOrObjectAttributes: /\s*(\w+:\s*((([\'\"]{0,1}[а-я\w\-\.\,\:\;\!\?\s\'\"\(\)\\\[\]\{\}]*[\'\"]{0,1})|\w*),)*)*/,
    spacesOrAttributes: /\s*(\s*\w+\s*=\s*([\'\"]{0,1}[а-я\w\-\.\,\:\;\!\?\s\'\"\(\)\\\[\]\{\}]*[\'\"]{0,1}))*/,
    styleTagWithContentGlobal: /\<style\>(.|\r?\n)*\<\/style\>/g,
    scriptTagWithContentGlobal: /\<script\>(.|\r?\n)*\<\/script\>/g,

    //
    // filenames
    //

    pluginClass: /(models|controllers|components|\w*widgets)[\/\\]\w+.php/,
    classRelatedFile: /(models|controllers|components|\w*widgets)[\/\\][\w\-\/\\]+[\/\\]\w+.(yaml|htm|php)/,
    filePath: /[\w\\\/\.\-]*/,
    pluginFilePath: /\/[\w\\\/\.\-]*/,
    rootFilePath: /\/[\w\\\/\.\-]*/,

    //
    // other
    //

    ajaxRequestGlobal: /((data\-request=)|((\$|oc).request\()|(ajaxHandler\())[\'\"]/g,
    ajaxRequestName: /^[\w\:]*$/,
    ajaxRequestNameWord: /[\w\:]+/,
    phpFunctionDeclarationStartGlobal: /function\s+\w+\s*\(/g,

    //#region Themes

    //
    // ini
    //

    themeFileProperty: /^\w+\s*\=\s*[\'\"]{0,1}\w+[\'\"]{0,1}/,
    layoutProperty: /^layout\s*\=\s*[\'\"]{0,1}\w+[\'\"]{0,1}\s*$/,
    iniProperty: /^\w+\s*\=\s*[\'\"]{0,1}[\w+\s*\-_\\\/]+[\'\"]{0,1}\s*$/,
    iniPropertyDivider: /\s*\=\s*/,
    layoutPropertySearch: /layout\s*\=\s*[\'\"]{0,1}\w+[\'\"]{0,1}/,

    //
    // php
    //

    varDefinitionGlobal: /\$this\[[\'\"]\w+[\'\"]\]\s*=/g,
    varNameInsideThis: /\[[\'\"]\w+[\'\"]\]/,
    arrayValueGlobal: /=>\s*[\'\"]/g ,
    phpPageUrlMethodGlobal: /->pageUrl\(\s*[\'\"]/g,
    phpPageUrlMethodParam: /^[\w\-\/\.]*$/,
    phpPageUrlMethodParamWord: /[\w\-\/\.]+/,
    phpPageUrlMethod: /->pageUrl\(\s*[\'\"].*[\'\"]/g,

    //
    // twig
    //

    twigStatement: /\{[\{\%].*[\}\%]\}/,
    twigEchoStatement: /\{\{.*\}\}/,
    twigEchoBracketsStart: /\{\{/,
    twigTagStatement: /\{\%.*\%\}/,
    twigTagBracketsStart: /\{\%/,
    twigEchoStatementStartGlobal: /\{\{/g,
    twigTagStatementStartGlobal: /\{\%/g,
    twigTagStart: /\{\%\s*\w+/,
    twigStatementWithFilterGlobal: /\{[\{\%].*\|/g,
    twigStatementWithTestGlobal: /\{[\{\%].*\s*is/g,

    setVarStatementGlobal: /\{\%\s*set\s+\w+\s*=/g,
    setVarStatementStart: /\{\%\s*set\s+/,

    pageFilteredStringGlobal: /[\'\"][\w\/\-.]+[\'\"]\s*\|\s*page/g,
    pageFilteredString: /[\'\"][\w\/\-.]+[\'\"]\s*\|\s*page/,
    pageName: /[\'\"][\w\/\-.]+[\'\"]/,
    pageFilteredStringTag: /[\'\"][\w*\/.\-]*[\'\"]\s*\|\s*page/,

    partialTagStartGlobal: /\{\%\s*partial\s+[\'\"]/g,
    partialTagStart: /\{\%\s*partial\s+[\'\"]/,
    partialTagGlobal: /\{\%\s*partial\s+[\'\"][\w\/\-.]+[\'\"]/g,
    partialTag: /\{\%\s*partial\s+[\'\"][\w\/\-.]+[\'\"]/,
    partialTagFull: /\{\%\s*partial\s+[\'\"][\w\/\-.]+[\'\"]\s+.*\%\}/,
    partialName: /[\'\"][\w\/\-.]+[\'\"]/,
    partialVarGlobal: /\{\{\s*\w+/g,
    partialFunctionWithName: /((\{\{)|=)\s*partial\s*\([\'\"][\w\/\-.]+[\'\"]/,
    partialFunctionArgsStartGlobal: /((\{\{)|=)\s*partial\s*\([\'\"][\w\/\-.]+[\'\"],\s*\{/g,
    partialFunction: /((\{\{)|=)\s*partial\s*\([\'\"][\w\/\-.]+[\'\"],\s*\{(\s*\w+\s*:.*)*\}\)/,
    partialFunctionGlobal: /((\{\{)|=)\s*partial\s*\([\'\"][\w\/\-.]+[\'\"],\s*\{(\s*\w+:\s*(([\'\"].*[\'\"],)|(\w+,)))*/g,
    partialFunctionWithoutName: /((\{\{)|=)\s*partial\s*\(/,
    partialFunctionStart: /((\{\{)|=)\s*partial\s*\([\'\"]/,

    contentTagsStartGlobal: /\{\%\s*content\s+[\'\"]/g,
    contentTagsStart: /\{\%\s*content\s+[\'\"]/,
    contentTagGlobal: /\{\%\s*content\s+[\'\"][\w\/\-.]+[\'\"]/g,
    contentTag: /\{\%\s*content\s+[\'\"][\w\/\-.]+[\'\"]/,
    contentName: /[\'\"][\w\/\-.]+[\'\"]/,
    contentVarGlobal: /\{\w+\}/g,

    componentTagStart: /\{\%\s*component\s+[\'\"]/,
    componentTagStartGlobal: /\{\%\s*component\s+[\'\"]/g,
    componentTag: /\{\%\s*component\s+[\'\"]\w+[\'\"]/,
    componentTagWithParams: /\{\%\s*component\s+[\'\"]\w+[\'\"]\s*(\w*\s*={0,1}\s*[\'\"]{0,1}\w*[\'\"]{0,1})*\s*\%\}/,
    componentTagFull: /\{\%\s*component\s+[\'\"]\w+[\'\"].*\%\}/,
    componentParams: /\s*(\w*={0,1}\w*)*\s*/,
    componentName: /[\'\"][\w+\/_]+[\'\"]/,

    putTagStartsGlobal: /\{\%\s*put\s/g,

    placeholderTagGlobal: /\{\%\s*placeholder\s+\w+/g,
    placeholderTagStart: /\{\%\s*placeholder\s+/,

    placeholderVarGlobal: /=\s*placeholder\([\'\"]\w+[\'\"]/g,
    placeholderVarStart: /=\s*placeholder\([\'\"]/,

    funcArgumentStartGlobal: /\{\{.+\w+\([\w*\'\"\-\.\(\),]*/g,
    tagArgumentStartGlobal: /\{\%\s*.*[\(=]/g,

    //#endregion

    //#region Plugins

    //
    // permissions
    //

    requiredPermissionsPropertyGlobal: /\$requiredPermissions\s+\=\s+[\[(array\()]/g,
    checkAccessMethodsGlobal: /(\->hasAccess\s*\(|\->hasAnyAccess\s*\(|\->hasPermission\s*\()\s*(\[|array\(){0,1}/g,
    permissionsList: /^\s*[\'\"]([\w\.-:]*[\'\"],\s*[\'\"])*[\w\.-:]*$/,
    permissionsListEntry: /[\w\.-:]+/,

    //
    // config
    //

    getConfigMethodGlobal: /config\s*\(|Config::get\s*\(/g,
    getConfigMethodArgs: /^\s*\[{0,1}\s*(\s*[\'\"][\w\.:]+[\'\"]\s*=>\s*.*,\s*)*[\'\"][\w\.:]*$/,
    configArgs: /\s*(-\s*[\w*\.]*)/,
    configWord: /[\w\.:]+/,

    //
    // php
    //

    phpPropertyMethodGlobal: /->property\(\s*[\'\"]/g,
    phpActionUrlMethodGlobal: /->actionUrl\(\s*[\'\"]\w*/g,
    phpBehaviorConfigPropertyGlobal: /public\s+(\$listConfig|\$formConfig|\$relationConfig|\$reorderConfig|\$importExportConfig|\$popupConfig)\s*\=\s*/g,
    phpStringOrArrayValue: /^([\'\"]|(\[|array\(){0,1}(\s*([\'\"]\w+[\'\"]\s*=>\s*([\'\"][\w\-\/\.]*[\'\"],\s*[\'\"]\w+[\'\"]\s*=>\s*)*)[\'\"]))[\w\-\/\.]*$/,
    phpStringOrrArrayValueWord: /[\w\-\/\.]+/,
    phpSetContextMethodGlobal: /::setContext\(/g,
    phpSetContextMethod: /::setContext\(/,
    phpSetContextParams: /^([\'\"][\w\.]*[\'\"]\s*,\s*){0,2}\s*[\'\"]$/,
    phpSetContextFirstParamStart: /^\s*[\'\"][\w\.]*$/,
    phpSetContextFirstParamWord: /[\w\.]+/,
    phpSetContextSecondParamStart: /^\s*[\'\"][\w\.]*[\'\"]\s*,\s*[\'\"]\w*$/,
    phpSetContextThirdParamStart: /^([\'\"][\w\.]*[\'\"]\s*,\s*){2}\s*[\'\"]\w*$/,
    phpSetContextParam: /[\'\"][\w\.]*[\'\"]/,
    phpMailSendMethodStartGlobal: /::send\s*\(\s*[\'\"]/g,
    phpMailSendToMethodStartGlobal: /::sendTo\s*\(\s*(([\'\"\w\@\$\-\>]+)|(\[.*\]))\s*,\s*[\'\"]/g,
    phpMailSendMethodFirstParamGlobal: /::send\s*\(\s*[\'\"].*?[\'\"]/g,
    phpMailSendToMethodSecondParamGlobal: /::sendTo\s*\(\s*(([\'\"\w\@\$\-\>]+)|(\[.*\]))\s*,\s*[\'\"].*?[\'\"]/g,
    phpMailTemplateName: /^[\w\.\:]*$/,
    phpMailTemplateNameWord: /^[\w\.\:]+/,
    phpQuotedMailTemplateNameWord: /[\'\"][\w\.\:]+[\'\"]/,
    phpMakingValidator: /(validator\(|Validator::make\()(.|\r?\n)*?\)/,
    phpValidationRulesValue: /[\w\|\:\,]*/,
    phpEnvFunctionGlobal: /env\([\'\"]/g,
    phpPluginNavIconGlobal: /icon[\'\"]\s*=>\s*[\'\"]/g,

    phpModelListAttributeGlobal: /(protected|public)\s+(array\s+){0,1}\$(guarded|fillable|dates|jsonable|visible|hidden|nullable|hashable|purgeable|encryptable|revisionable)\s*=\s*(\[|array\()/g,
    phpModelAssociativeAttributesGlobal: /(protected|public)\s+(array\s+){0,1}\$(slugs|rules|casts|attributeNames)\s*=\s*(\[|array\()/g,
    phpModelRulesAttributesGlobal: /(protected|public)\s+(array\s+){0,1}\$rules\s*=\s*(\[|array\()/g,
    phpModelRulesValues: /^\s*(\s*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"]([\w:,=\/]*\|)*$/,
    phpModelCustomMessagesAttributeGlobal: /\$customMessages\s*=\s*(\[|array\()/g,
    phpModelCustomMessagesAttributesArrayKeys: /^\s*(\s*[\'\"][\w\*\-\.]+[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"][\w\*\-\.]*$/,
    phpModelCustomMessagesAttributeKey: /[\w\*\-\.]+/,
    phpModelAttributesList: /^\s*[\'\"](\w*[\'\"],\s*[\'\"])*$/,
    phpModelAttributesArrayKeys: /^\s*(\s*[\'\"][\w\*\-\.]+[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"]$/,
    phpModelTableAttribute: /(protected|public)\s+\$table\s*=\s*[\'\"]\w+[\'\"]/,

    phpMakePartialMethodsGlobal: /->\s*(makePartial|makeHintPartial)\s*\(\s*[\'\"][\$\~]{0,1}[\w\.\-\/\\]+[\'\"]/g,
    phpMakePartialMethodPartialParam: /[\'\"][\$\~]{0,1}[\w\.\-\/\\]+[\'\"]/,
    phpMakePartialMethodStartGlobal: /->\s*(makePartial|makeHintPartial)\s*\(\s*[\'\"]/g,
    phpMakePartialMethodStartParamStart: /^[\w\$\/]*$/,
    phpMakePartialMethodParamWord: /[\w\$\/]+/,

    phpSchemaGlobal: /Schema::(create|table|drop|dropIfExists)\s*\(\s*[\'\"]\w+[\'\"]/g,
    phpSchemaTableName: /[\'\"]\w+[\'\"]/,

    phpRelationRenderMethodStartGlobal: /->relationRender\(\s*[\'\"]/g,

    //
    // Yaml
    //

    yamlPermissionsTagGlobal: /permission(s{0,1}):/g,
    yamlFormControllerModelPermissionsGlobal: /model(Create|Update|Delete|Preview):/g,
    yamlPermissionsValue: /(^\s+$)|(^\s+[\w\-\.\s]*-\s+$)/,

    yamlModelClassTagGlobal: /modelClass:/g,
    yamlModelClassValue: /^\s+[\w\\]*$/,

    yamlVersionGlobal: /[a-zA-Z0-9\-\_\.]+\:/g,
    yamlVersionToMigrationRows: /^\s+-\s+[\#а-яА-Я\w\-\/\.\,\!\?\s\'\"\(\)\\\[\]\{\}]+\s+-\s+([\#\w\-\.\!\?\s]+\s+-\s+)*$/,

    yamlPartialPathAttributeGlobal: /\s*(path)\:/g,
    yamlPartialPathAttributePlugin: /\s*(path)\:\s*\$/,
    yamlPartialPathAttributeRoot: /\s*(path)\:\s*\~/,

    yamlRelationPropertyAttributeGlobal: /\s*(relation)\:/g,

    yamlConfigPathAttributeGlobal: /\s*(list|form|groups|filter)\:/g,
    yamlConfigPathAttributePlugin: /\s*(list|form|groups|filter)\:\s*\$/,
    yamlConfigPathAttributeRoot: /\s*(list|form|groups|filter)\:\s*\~/,

    yamlOptionsAttributeGlobal: /\s*options\:/g,
    yamlScopeAttributeGlobal: /\s*scope\:/g,
    yamlSearchScopeAttributeGlobal: /\s*searchScope\:/g,
    yamlModelScopeAttributeGlobal: /\s*modelScope\:/g,

    //#endregion

};
