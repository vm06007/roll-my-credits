# Demo Components

This directory contains self-contained components for each tab in the Demo interface.

## Components

### EncodeKeyInPoster
- **Purpose**: Handles encoding secret keys into movie posters
- **Props**: `movies[]`, `styles_options[]`, `wordTypes[]` (static data only)
- **Features**:
    - Self-managed state for all form inputs
    - Input mode selection (Free Input / 12 Words)
    - Upload method selection (Upload Image / Generate with AI)
    - Two-card layout with original and encoded image preview
    - Integrated API calls and validation logic

### DecodeKeyFromPoster
- **Purpose**: Extracts hidden keys from steganography poster images
- **Props**: None (fully self-contained)
- **Features**:
    - Self-managed file upload and decoding state
    - Simple file upload interface
    - Result display area for decoded keys
    - Integrated API calls

### EncodeKeyInCredits
- **Purpose**: Hides secret keys in movie credit scene videos
- **Props**: `wordTypes[]` (static data only)
- **Features**:
    - Self-managed state for all form inputs
    - Input mode selection (Free Input / 12 Words)
    - Video upload interface
    - Two-card layout with original and encoded video preview
    - Integrated API calls and validation logic

### DecodeKeyFromCredits
- **Purpose**: Extracts hidden keys from steganography credit scene videos
- **Props**: None (fully self-contained)
- **Features**:
    - Self-managed file upload and decoding state
    - Video file upload interface
    - Result display area for decoded keys
    - Integrated API calls

## Architecture

Each component:
- **Self-contained**: Manages its own state with `useState` hooks
- **Minimal props**: Only receives static data (no state/setters passed down)
- **Independent**: Can be used standalone without complex prop drilling
- **Encapsulated**: All business logic, API calls, and validation contained within
- **Shared styling**: Uses `../DemoA.module.sass` for consistent appearance

## Benefits

- **No prop drilling**: Components manage their own state
- **Better separation of concerns**: Each component is responsible for its own functionality
- **Easier testing**: Components can be tested in isolation
- **Improved maintainability**: Changes to one component don't affect others
- **Cleaner interfaces**: Simple prop types with only essential data

## Import

Components can be imported individually or via barrel export:

```typescript
// Individual imports
import EncodeKeyInPoster from './EncodeKeyInPoster';

// Barrel export (recommended)
import { EncodeKeyInPoster, DecodeKeyFromPoster } from './components';
```