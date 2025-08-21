// Image mapping utility for post images
import hackathonImg from '../pics/hackathon.png';
import mackbookImg from '../pics/mackbook.jpg';
import holidayScheduleImg from '../pics/HolidaySchedule.jpg';

// Map specific posts to their images
export function getPostImage(post) {
  // Map specific posts to their images
  if (post.title === "Hackathon 2024") {
    return hackathonImg;
  }
  if (post.title === "Found Silver MacBook Pro") {
    return mackbookImg;
  }
  if (post.title === "Holiday Schedule Update") {
    return holidayScheduleImg;
  }
  
  // Default fallback
  return hackathonImg;
}
