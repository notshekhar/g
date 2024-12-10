#!/usr/bin/env node
const { Command } = require("commander")
const fs = require("node:fs")
const path = require("path")

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

const program = new Command()

program
    .name("g")
    .description("Generate files for your project")
    .argument(
        "<type>",
        "Type of the file (controller, service, repository, or file)"
    )
    .argument(
        "<name>",
        "Name of the file (for file type, provide full path with extension)"
    )
    .action(async (type, name) => {
        try {
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
                    console.error(`Error: File "${filePath}" already exists.`)
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
                    console.error(`Error: File "${filePath}" already exists.`)
                    process.exit(1)
                }

                await fs.promises.writeFile(filePath, `// ${type}: ${name}`)
                console.log(`Created: ${filePath}`)
            }
        } catch (err) {
            console.error("Error:", err.message)
            process.exit(1)
        }
    })

program.parse()
