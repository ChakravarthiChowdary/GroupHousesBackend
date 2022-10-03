import { RequestHandler } from "express";
import fileUpload from "express-fileupload";
import { validationResult } from "express-validator";

import HttpError from "../models/HttpError";
import LatestNews from "../schema/latestNews";
import NewsImage from "../schema/newsImage";
import User from "../schema/users";
import { translations } from "../constants/translations";

/** Developer routes */
export const deleteLatestNews: RequestHandler = async (req, res, next) => {
  await LatestNews.deleteMany();

  res.json({ deleted: true });
};
/** Developer routes end */

export const getLatestNews: RequestHandler = async (req, res, next) => {
  const latestNews = await LatestNews.find();

  res.json({
    latestNews: latestNews.sort(
      (a, b) =>
        new Date(a.createdDate).valueOf() - new Date(b.createdDate).valueOf()
    ),
    count: latestNews.length,
  });
};

export const postLatestNews: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, userId } = req.body;

  const user = await User.findById(userId).exec();

  if (!user) {
    return next(new HttpError(translations.userIdNotFound, 400));
  }

  const latestNews = new LatestNews({
    title,
    description,
    userId,
    photoUrls: [],
    createdDate: new Date(),
    userPhoto: user.photoUrl,
  });

  const result = await latestNews.save();

  res.json(result);
};

export const uploadNewsImage: RequestHandler = async (req, res, next) => {
  try {
    let image: fileUpload.UploadedFile;
    let uploadPath;
    const basicPath = "http://localhost:5000/uploads";

    const { userId, ticketId } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new HttpError(translations.fileNotUploaded, 400));
    }

    image = req.files.image;

    if (!image) {
      return next(new HttpError(translations.imageNotAttached, 400));
    }

    const extension = image.name.split(".")[1];

    const imageDoc = new NewsImage({
      title: image.name,
      photoUrl: `${basicPath}/${image.name}`,
      createdDate: new Date(),
      userId,
    });

    const result = await imageDoc.save();

    await NewsImage.findByIdAndUpdate(result.id, {
      photoUrl: `${basicPath}/${result.id}.${extension}`,
    });

    const updatedImage = await NewsImage.findById(result.id);

    if (!updatedImage) {
      return next(new HttpError(translations.serverError, 500));
    }

    uploadPath = __dirname + "/public/uploads/" + result.id + "." + extension;
    image.mv(uploadPath, function (err: any) {
      if (err) return res.status(500).send(err);
    });

    await LatestNews.findByIdAndUpdate(ticketId, {
      photoUrls: [updatedImage.photoUrl],
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    next(error);
  }
};

export const getMyPosts: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.userId;

    if (userId !== req.body.id) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const user = await User.findById(userId).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const posts = await LatestNews.find({ userId }).exec();

    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

export const deleteNews: RequestHandler = async (req, res, next) => {
  try {
    const newsId = req.params.newsId;

    if (!newsId) {
      return next(new HttpError("News Id is compulsory to delete news.", 400));
    }

    const userId = req.body.id;

    const user = await User.findById(userId).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const news = await LatestNews.findById(newsId).exec();

    if (!news) {
      return next(new HttpError("There is problem with the News Id.", 400));
    }

    if (news.userId !== user.id) {
      return next(new HttpError("Cannot delete news.", 403));
    }

    await LatestNews.deleteOne({ id: news.id }).exec();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const likeNews: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.body;
    const newsId = req.params.newsId;
    const news = await LatestNews.findById(newsId).exec();

    if (!news) {
      return next(new HttpError("There is a problem with the news Id", 400));
    }

    const user = await User.findById(id).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const alreadyLikedNews = await LatestNews.find({
      $and: [{ id: newsId }, { likedUsers: { $in: [user.id] } }],
    });

    if (alreadyLikedNews.length > 0) {
      await LatestNews.findByIdAndUpdate(newsId, {
        $pull: { likedUsers: id },
      }).exec();

      res.status(200).json({ liked: false });
      return;
    }

    await LatestNews.findByIdAndUpdate(newsId, {
      $push: { likedUsers: id },
    }).exec();

    res.status(200).json({ liked: true });
  } catch (error) {
    next(error);
  }
};

export const makeNewsFav: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.body;
    const newsId = req.params.newsId;
    const news = await LatestNews.findById(newsId).exec();

    if (!news) {
      return next(new HttpError("There is a problem with the news Id", 400));
    }

    const user = await User.findById(id).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const alreadyFavNews = await LatestNews.find({
      $and: [{ id: newsId }, { favUsers: { $in: [user.id] } }],
    });

    if (alreadyFavNews.length > 0) {
      await LatestNews.findByIdAndUpdate(newsId, {
        $pull: { favUsers: id },
      }).exec();

      res.status(200).json({ fav: false });
      return;
    }

    await LatestNews.findByIdAndUpdate(newsId, {
      $push: { favUsers: id },
    }).exec();

    res.status(200).json({ fav: true });
  } catch (error) {
    next(error);
  }
};

export const getFavAndLikedNews: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.body;

    const user = await User.findById(id).exec();

    if (!user) {
      return next(new HttpError(translations.userIdNotFound, 400));
    }

    const likedResult = await LatestNews.find({
      likedUsers: { $in: [id] },
    }).exec();
    const favResult = await LatestNews.find({ favUsers: { $in: [id] } }).exec();

    res.status(200).json({ likedNews: likedResult, favNews: favResult });
  } catch (error) {
    next(error);
  }
};
