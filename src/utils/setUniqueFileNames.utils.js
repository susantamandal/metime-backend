import fs from "fs";

export const setUniqueProfileAvatarFileName = async function (req) {

    if(!req.file) return "";

    const { destination, path, filename } = req.file;

    if (!path) {
        throw new ApiError(400, `avatar file is required`);
    }

    const fileExtension = filename?.split('.').pop();
    const uniqueFileName = `profile-avatar-${req.user._id}${fileExtension !== filename ? ("." + fileExtension) : ""}`;
    const newPath = destination + "/" + uniqueFileName;

    await fs.rename(path, newPath, (error) => {
        if (error) {
            throw new ApiError(500, "error in renaming avatar file, try again later");
        }
    });

    return newPath;
}

export const setUniqueCoverPhotoFileName = async function (req) {

    if(!req.file) return "";

    const { destination, path, filename } = req.file;

    if (!path) {
        throw new ApiError(400, `coverPhoto file is required`);
    }

    const fileExtension = filename?.split('.').pop();
    const uniqueFileName = `cover-photo-${req.user._id}${fileExtension !== filename ? ("." + fileExtension) : ""}`;
    const newPath = destination + "/" + uniqueFileName;

    await fs.rename(path, newPath, (error) => {
        if (error) {
            throw new ApiError(500, "error in renaming coverPhoto file, try again later");
        }
    });

    return newPath;
}

export const setUniqueCommentMediaFileName = async function (req) {

    if(!req.file) return "";

    const { destination, path, filename } = req.file;

    if (!path) {
        throw new ApiError(400, `media file is required`);
    }

    const fileExtension = filename?.split('.').pop();
    const uniqueFileName = `comment-media-${req.comment._id}${fileExtension !== filename ? ("." + fileExtension) : ""}`;
    const newPath = destination + "/" + uniqueFileName;

    await fs.rename(path, newPath, (error) => {
        if (error) {
            throw new ApiError(500, "error in comment media file, try again later");
        }
    });

    return newPath;
}

export const setUniquePostMediaFileNames = async function (req) {

    let mediaFiles = req.files, mediaLocalFilePaths= [];

    if (Array.isArray(mediaFiles) && mediaFiles?.length === 0) {
        return [];
    }

    for (let index = 0; index < mediaFiles.length ; index++) {

        const { destination, path, filename } = mediaFiles[index];

        if (!path) {
            throw new ApiError(400, `media file is required`);
        }

        const fileExtension = filename?.split('.').pop();
        const uniqueFileName = `post-${req.post._id}-media-${index+1}${fileExtension !== filename ? ("." + fileExtension) : ""}`;
        const newPath = destination + "/" + uniqueFileName;

        await fs.rename(path, newPath, (error) => {
            if (error) {
                throw new ApiError(500, "error in renaming post media files, try again later");
            }
        });

        mediaLocalFilePaths.push(newPath)
    }
    
    return mediaLocalFilePaths;
}