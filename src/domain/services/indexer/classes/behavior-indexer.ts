import * as fs from 'fs';
import * as phpParser from 'php-parser';
import { ControllerBehavior, ModelBehavior } from "../../../entities/classes/behavior";

export class BehaviorIndexer {

    index(filePath: string): ModelBehavior | ControllerBehavior | undefined {
        if (!fs.existsSync(filePath)) {
            return;
        }

        const fileContent = fs.readFileSync(filePath);


    }
}
