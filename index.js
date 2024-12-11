#!/usr/bin/env node
const yargs = require("yargs")
const fs = require("node:fs")
const path = require("path")
const packageJson = require("./package.json")
const { execSync } = require("child_process")

function updateModule() {
    try {
        console.log("Updating to the latest version...")
        execSync("npm install -g g@latest", { stdio: "inherit" })
        console.log("Successfully updated to the latest version!")
    } catch (error) {
        console.error("Error updating the module:", error.message)
        process.exit(1)
    }
}

function pluralize(word) {
    // If word ends in y and the letter before y is a consonant
    if (word.endsWith("y") && !/[aeiou]/.test(word[word.length - 2])) {
        return word.slice(0, -1) + "ies"
    }
    // If word ends in s, x, z, ch, sh
    if (word.match(/(s|x|z|ch|sh)$/)) {
        return word + "es"
    }
    // Default case: add s
    return word + "s"
}

yargs(process.argv.slice(2))
    .usage("Usage: $0 <type> <name>")
    .version("v", "Show version number", packageJson.version)
    .option("u", {
        alias: "update",
        describe: "Update the module to the latest version",
        type: "boolean",
    })
    .command({
        command: "* [type] [name]", // Make arguments optional
        describe: "Generate files for your project",
        builder: (yargs) => {
            return yargs
                .positional("type", {
                    describe:
                        "Type of the file (controller, service, repository, or file)",
                    type: "string",
                })
                .positional("name", {
                    describe:
                        "Name of the file (for file type, provide full path with extension)",
                    type: "string",
                })
        },
        handler: async (argv) => {
            if (argv.update) {
                updateModule()
                process.exit(0)
            }

            if (!argv.type || !argv.name) {
                console.error(
                    "Error: Both type and name must be provided when not updating."
                )
                process.exit(1)
            }

            try {
                const { type, name } = argv
                if (!type || !name) {
                    console.error("Error: Both type and name must be provided.")
                    process.exit(1)
                }

                if (type === "file") {
                    // Handle 'file' type
                    const filePath = path.join(process.cwd(), "src", name)

                    await fs.promises.mkdir(path.dirname(filePath), {
                        recursive: true,
                    })
                    if (fs.existsSync(filePath)) {
                        console.error(
                            `Error: File "${filePath}" already exists.`
                        )
                        process.exit(1)
                    }

                    await fs.promises.writeFile(
                        filePath,
                        `// File: ${path.basename(filePath)}`
                    )
                    console.log(`Created: ${filePath}`)
                } else {
                    // Handle 'controller', 'service', 'repository', etc.
                    const pluralType = pluralize(type)
                    const baseDir = path.join(process.cwd(), "src", pluralType)
                    const filePath = path.join(baseDir, `${name}.${type}.ts`)

                    await fs.promises.mkdir(baseDir, { recursive: true })
                    if (fs.existsSync(filePath)) {
                        console.error(
                            `Error: File "${filePath}" already exists.`
                        )
                        process.exit(1)
                    }

                    await fs.promises.writeFile(filePath, `// ${type}: ${name}`)
                    console.log(`Created: ${filePath}`)
                }
            } catch (err) {
                console.error("Error:", err.message)
                process.exit(1)
            }
        },
    })
    .epilogue(
        `
Examples:
  $ g controller user          # Creates src/controllers/user.controller.ts
  $ g service auth            # Creates src/services/auth.service.ts
  $ g repository product      # Creates src/repositories/product.repository.ts
  $ g file utils/helper.ts   # Creates src/utils/helper.ts
  $ g update                 # Updates the package to latest version`
    )
    .help()
    .strict().argv
