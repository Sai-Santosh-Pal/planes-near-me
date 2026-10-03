export const fetchData = async (props) => {
    const url = `https://sai-santosh-pal.hackclub.app/${props.lat}/${props.long}/${props.radius}`
    const response = await fetch(url)
    const data = await response.json()
    return data
}