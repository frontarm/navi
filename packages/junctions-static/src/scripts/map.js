import createMap from '../createMap'

export default async function map(mainFile, publicFolder) {
    let siteMap = await createMap(mainFile, publicFolder)

    // TODO: find a nicer format to print the map
    // - maybe find length of longest URL, and pad all URLS, then just add titles or -> and redirect url?
    console.log(siteMap)
}