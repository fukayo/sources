import { readdirSync, rmSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const args = process.argv.slice(2)
if (!args[0]?.startsWith('v')) throw Error(`bad tag:${args[0]}`)
const FILENAME = fileURLToPath(import.meta.url)

const DIRNAME = dirname(FILENAME)
export const hack = import.meta.glob(['./*.ts', './*.js', '!./*.d.ts'], { eager: true })

const all = Object
  .keys(hack)
  .map(key => {
    const { publicSettings } = (hack[key] as { publicSettings: { id: string } })
    const icon = readdirSync(DIRNAME).find(f => new RegExp(`^${publicSettings.id}\\.(svg|png|jpg|webp)$`).test(f))
    if (!icon) throw Error(`${publicSettings.id} has no icon`)
    return {
      ...publicSettings,
      url: `https://github.com/fukayo/sources/releases/download/${args[0]}/${publicSettings.id}.js`,
      icon: `https://github.com/fukayo/sources/releases/download/${args[0]}/${icon}`
    }
  })

writeFileSync(resolve(DIRNAME, 'all.json'), JSON.stringify(all))
rmSync(FILENAME)
