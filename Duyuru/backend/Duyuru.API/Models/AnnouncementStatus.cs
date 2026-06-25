namespace Duyuru.API.Models
{
    public enum AnnouncementStatus
    {
        PendingEditor,
        PendingModerator,
        Published,
        Rejected,
        Withdrawn = 4
    }
}
