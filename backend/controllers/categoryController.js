const Category = require('../models/Category');
const slugify = require('../utils/slugify');

exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    const category = await Category.create({ name, slug: slugify(name), image, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const { name, image, description } = req.body;
    if (name) { category.name = name; category.slug = slugify(name); }
    if (image !== undefined) category.image = image;
    if (description !== undefined) category.description = description;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
};
