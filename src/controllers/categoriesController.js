export const getCategories = async (req, res) => {
  const categories = ['popular', 'general'];
  res.status(200).json(categories);
};