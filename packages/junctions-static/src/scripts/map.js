import createMap from '../createMap'

export default async function map(mainFile, publicFolder) {
    let siteMap = await createMap(mainFile, publicFolder)

    // TODO: find a nicer format to print the map
    console.log(siteMap)
}