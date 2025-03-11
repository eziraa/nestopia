import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

export const uploadPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files) {
      res.status(400).send("No files were uploaded");
    }

    const photos = (req.files as Express.Multer.File[]).filter((file) =>
      file.mimetype.startsWith("image")
    );
    if (!photos.length) {
      next();
    }
    const promises = photos.map(async (photo) => {
      const filePath = path.join(__dirname, "uploads", photo.originalname);
      await fs.promises.writeFile(filePath, photo.buffer);
      // Generate a URL to access the file
      const fileUrl = process.env.UPLOAD_DIR + `uploads/${photo.originalname}`;
      return fileUrl;
    });

    const photoUrls = await Promise.all(promises);
    req.body.photoUrls = photoUrls;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while uploading files");
  }
};
