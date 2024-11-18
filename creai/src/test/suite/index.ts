import * as path from 'path';
import Mocha = require('mocha');
import { glob } from 'glob';
import { promisify } from 'util';

export async function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 30000
    });

    const testsRoot = path.resolve(__dirname, '..');

    try {
        // Use glob with promises
        const files = await glob('**/**.test.js', { 
            cwd: testsRoot 
        });

        // Add files to the test suite
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        return new Promise((resolve, reject) => {
            try {
                // Run the mocha test
                mocha.run((failures: number): void => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    } catch (err) {
        console.error('Error during test setup:', err);
        throw err;
    }
} 