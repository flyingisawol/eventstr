interface Props {
    location: string
  }



const ApiEmbed = ({location}:Props) =>{
    const baseURL = "https://www.google.com/maps/embed/v1/place?key="
    const google_key = process.env?.REACT_APP_API_KEY
    const fullURL = `${baseURL}${google_key}&q=${location}`
    return (
        <div>
            <iframe
                title="GoogleEmbed"
                width="400"
                height="450"
                referrerPolicy="no-referrer-when-downgrade"
                src={fullURL}
                loading="lazy"
                allowFullScreen
                
            >
            </iframe>
        </div>
    )


}

export default ApiEmbed


