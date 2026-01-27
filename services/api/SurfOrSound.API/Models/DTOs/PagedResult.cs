namespace SurfOrSound.API.Models.DTOs;

public record PagedResult<T>
{
    public List<T> Items { get; init; } = new();
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}
