#!/usr/bin/env node
const yargs = require("yargs")
const fs = require("node:fs")
const path = require("path")
const packageJson = require("./package.json")

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
    .command({
        command: "* <type> <name>",
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
  $ g file utils/helper.ts   # Creates src/utils/helper.ts`
    )
    .version(packageJson.version)
    .help()
    .strict().argv
