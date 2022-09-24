import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class CommandGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        commandTemplate: {
            destination: 'console/{{ command_pascal }}.php',
            template: require('./templates/command/class.twig')
        }
    };

    protected setVars(vars: TemplateVars): void {

        if (!vars.command) {
            throw new PropertyIsRequired('Property "command" is required');
        }

        super.setVars({
            command: vars.command,
            description: vars.description || 'No description provided yet...',
            hidden: !!vars.hidden
        });
    }
}
