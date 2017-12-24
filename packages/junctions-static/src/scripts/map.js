import createMap from '../createMap'

export default async function map(mainFile, publicFolder) {
    let siteMap = await createMap(mainFile, publicFolder)

    console.log(siteMap)
    // TODO: print the map
}