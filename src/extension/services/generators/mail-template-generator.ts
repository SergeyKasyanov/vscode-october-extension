import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";

export class MailTemplateGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        file: {
            destination: 'views/mail/{{ filename }}.htm',
            template: require('./templates/mail/template.twig')
        }
    };

    protected setVars(vars: TemplateVars): void {
        if (!vars.filename) {
            throw new PropertyIsRequired('Property "filename" is required');
        }

        super.setVars({
            filename: vars.filename,
            subject: vars.subject,
        });
    }

}
