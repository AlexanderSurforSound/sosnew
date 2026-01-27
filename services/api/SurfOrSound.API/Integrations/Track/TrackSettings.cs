namespace SurfOrSound.API.Integrations.Track;

public class TrackSettings
{
    public string BaseUrl { get; set; } = "https://api.trackhs.com/v1";
    public string PaymentsUrl { get; set; } = "https://payments.trackhs.com/v1";
    public string ApiKey { get; set; } = "";
    public string PropertyManagerId { get; set; } = "";
}
