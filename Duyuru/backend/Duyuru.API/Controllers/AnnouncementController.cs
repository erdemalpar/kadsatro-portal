using Duyuru.API.DTOs;
using Duyuru.API.Models;
using Duyuru.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Duyuru.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _service;

        public AnnouncementController(IAnnouncementService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnnouncementResponseDto>>> GetAnnouncements([FromQuery] Role role)
        {
            var announcements = await _service.GetAnnouncementsByRoleAsync(role);
            return Ok(announcements);
        }

        [HttpPost]
        public async Task<ActionResult<AnnouncementResponseDto>> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
        {
            var result = await _service.CreateAnnouncementAsync(dto);
            return CreatedAtAction(nameof(GetAnnouncements), new { id = result.Id }, result);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<AnnouncementResponseDto>> UpdateStatus(int id, [FromBody] UpdateAnnouncementStatusDto dto, [FromQuery] Role role)
        {
            try
            {
                var result = await _service.UpdateStatusAsync(id, dto, role);
                if (result == null) return NotFound("Duyuru bulunamadı.");
                
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                // In ASP.NET Core, Forbid() is generally used with authentication schemes, 
                // but since we don't have a real one, StatusCode 403 is safer to return directly.
                return StatusCode(403, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AnnouncementResponseDto>> UpdateAnnouncement(int id, [FromBody] UpdateAnnouncementDto dto, [FromQuery] Role role)
        {
            try
            {
                var result = await _service.UpdateAnnouncementAsync(id, dto, role);
                if (result == null) return NotFound("Duyuru bulunamadı.");
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAnnouncement(int id, [FromQuery] Role role)
        {
            try
            {
                var success = await _service.DeleteAnnouncementAsync(id, role);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var stats = await _service.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("chart")]
        public async Task<ActionResult<ChartDataDto>> GetChartData([FromQuery] string period = "weekly")
        {
            var data = await _service.GetChartDataAsync(period);
            return Ok(data);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadMedia(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya seçilmedi.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{uniqueFileName}";
            return Ok(new { url = fileUrl });
        }

        [HttpGet("unread")]
        public async Task<ActionResult<IEnumerable<AnnouncementResponseDto>>> GetUnreadAnnouncements([FromQuery] int userId)
        {
            var unread = await _service.GetUnreadAnnouncementsAsync(userId);
            return Ok(unread);
        }

        [HttpPost("{id}/read")]
        public async Task<ActionResult> MarkAsRead(int id, [FromQuery] int userId)
        {
            var success = await _service.MarkAsReadAsync(id, userId);
            if (!success) return BadRequest("İşlem başarısız.");
            return Ok();
        }

        [HttpGet("{id}/readers")]
        public async Task<ActionResult<IEnumerable<AnnouncementReaderDto>>> GetReaders(int id)
        {
            var readers = await _service.GetReadersAsync(id);
            return Ok(readers);
        }
    }
}
