# API Guide: Displaying Project & Unit Images

This guide describes how to consume image data from the API and display it correctly in the Frontend.

## 1. Static File Serving
The backend serves uploaded files through a dedicated static route.
- **Base URL**: `http://localhost:3000` (or your production API URL)
- **Static Route**: `/uploads`
- **Full Path Template**: `{BASE_URL}/uploads/{filename}`

## 2. API Responses

### Project Images
When fetching a project (e.g., `GET /projects/:id`), the `images` field is an array of strings (filenames).

**Response Snippet:**
```json
{
  "_id": "678523c9...",
  "name": "Mooon Tower",
  "images": [
    "7a1b2c3d4e5f6g7h8i9j.jpg",
    "0k1l2m3n4o5p6q7r8s9t.png"
  ],
  ...
}
```

### Unit Images
Similarly, units (e.g., `GET /units/:id`) return an `images` array.

**Response Snippet:**
```json
{
  "_id": "678524d0...",
  "number": "A-101",
  "images": [
    "1u2v3w4x5y6z7a8b9c0d.webp"
  ],
  ...
}
```

## 3. Frontend Integration

### URL Construction Logic
Do not store hardcoded URLs in your components. Use a utility function to construct the full path.

```javascript
const API_BASE_URL = 'http://localhost:3000';

function getFullImageUrl(filename) {
  if (!filename) return '/placeholder-image.png';
  return `${API_BASE_URL}/uploads/${filename}`;
}
```

### Displaying a Gallery
For Projects and Units, iterate through the `images` array.

```jsx
const ProjectGallery = ({ project }) => {
  return (
    <div className="gallery">
      {project.images.map((filename, index) => (
        <img 
          key={index}
          src={getFullImageUrl(filename)} 
          alt={`${project.name} view ${index + 1}`} 
        />
      ))}
    </div>
  );
};
```

## 4. Summary of Field Names
| Entity | Field Name | Type | Key Component |
| :--- | :--- | :--- | :--- |
| **Project** | `images` | `Array<String>` | Project Detail, Project Cards |
| **Unit** | `images` | `Array<String>` | Unit Detail, Unit Cards |
| **Location** | `image` | `String` | Location Cards |
| **Developer** | `logo` | `String` | Developer Detail |

> [!TIP]
> Always check if the `images` array exists and has length (`project.images?.length > 0`) before attempting to render.
