namespace SurfOrSound.API.Integrations.RemoteLock;

public class RemoteLockSettings
{
    public string BaseUrl { get; set; } = "https://api.remotelock.com";
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
}
