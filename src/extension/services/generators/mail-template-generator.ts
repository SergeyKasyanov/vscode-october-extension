import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import template from './templates/mail/template.twig';

export class MailTemplateGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        file: {
            destination: 'views/mail/{{ filename }}.htm',
            template
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
