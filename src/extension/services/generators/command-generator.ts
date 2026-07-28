import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import template from './templates/command/class.twig';

export class CommandGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        commandTemplate: {
            destination: 'console/{{ command_pascal }}.php',
            template: template
        }
    };

    protected setVars(vars: TemplateVars): void {

        if (!vars.command) {
            throw new PropertyIsRequired('Property "command" is required');
        }

        super.setVars({
            command: vars.command,
            description: vars.description || 'No description provided yet...',
            hidden: !!vars.hidden,
            useSignature: this.project.platform!.usesSignaturesInCommands,
        });
    }
}
