export type Section = { head?: string; box?: boolean; items: string[] };
export type Block =
  | { kind: "list"; title?: string; items: string[] }
  | { kind: "group"; bare?: boolean; sections: Section[] };
export type Item =
  | { kind: "label"; text: string; big?: boolean }
  | { kind: "node"; text: string; blue?: boolean; left?: Block; right?: Block };

// In item names: "~" = blue box, "_" = white box
export const SPINE: Item[] = [
  { kind: "label", text: "Data Analyst", big: true },
  { kind: "node", text: "Introduction",
    left: { kind: "group", sections: [{ head: "Key Concepts of Data", box: true, items: ["Collection", "Cleanup", "Exploration", "Visualisation", "Statistical Analysis", "Machine Learning"] }] },
    right: { kind: "list", items: ["What is Data Analytics"] } },
  { kind: "node", text: "Types of Data Analytics",
    right: { kind: "list", items: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"] } },
  { kind: "label", text: "Building a Strong Foundation" },
  { kind: "node", text: "Excel",
    left: { kind: "group", sections: [
      { items: ["IF", "DATEDIF", "VLOOKUP / HLOOKUP", "REPLACE / SUBSTITUTE", "UPPER / LOWER / PROPER", "CONCAT", "TRIM", "AVERAGE", "COUNT", "SUM", "MIN / MAX"] },
      { head: "Learn Common Functions", items: ["Charting", "Pivot Tables"] }] } },
  { kind: "node", text: "Learn SQL", blue: true },
  { kind: "label", text: "Gain Programming Skills" },
  { kind: "node", text: "Learn a Language", right: { kind: "list", items: ["~Python", "~R"] } },
  { kind: "node", text: "Data Manipulation Libs" },
  { kind: "node", text: "Data Viz. Libraries" },
  { kind: "label", text: "Mastering Data Handling" },
  { kind: "node", text: "Data Collection", left: { kind: "list", items: ["CSV Files", "Web Scraping", "Databases", "APIs"] } },
  { kind: "node", text: "Data Cleanup",
    left: { kind: "group", bare: true, sections: [{ head: "Libraries for Cleanup", items: ["Pandas", "Dplyr"] }] },
    right: { kind: "list", items: ["Handling Missing Data", "Removing Duplicates", "Finding Outliers", "Data Transformation"] } },
  { kind: "label", text: "Data Analysis Techniques" },
  { kind: "node", text: "Descriptive Analysis",
    left: { kind: "group", sections: [
      { head: "Dispersion", box: true, items: ["Range", "Variance", "Standard Deviation"] },
      { head: "Central Tendency", box: true, items: ["Mean", "Median", "Mode"] },
      { head: "Distribution Shape", box: true, items: ["Skewness", "Kurtosis"] }] },
    right: { kind: "list", items: ["_Generating Statistics", "Visualizing Distributions"] } },
  { kind: "node", text: "Data Visualisation",
    right: { kind: "group", sections: [
      { head: "Tools", items: ["~Power BI", "Tableau"] },
      { head: "Libraries", items: ["Matplotlib", "ggplot2", "Seaborn"] },
      { head: "Charting", items: ["Bar", "Histograms", "Line", "Stacked", "Scatter", "Heatmap", "Funnel", "Pie"] }] } },
  { kind: "node", text: "Statistical Analysis",
    left: { kind: "list", title: "Learn Different Techniques", items: ["Hypothesis Testing", "Correlation Analysis", "Regression"] } },
  { kind: "label", text: "Advanced Topics" },
  { kind: "node", text: "Machine Learning",
    left: { kind: "group", bare: true, sections: [
      { head: "Machine Learning Types", items: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"] },
      { head: "Popular ML Algorithms", items: ["Decision Trees", "Naive Bayes", "KNN", "K-Means Clustering", "Logistic Regression"] },
      { items: ["Model Evaluation"] }] } },
  { kind: "node", text: "ML Roadmap", blue: true },
  { kind: "node", text: "Big Data Technologies",
    right: { kind: "group", sections: [
      { items: ["Big Data Concepts", "Data Storage Solutions"] },
      { head: "Data Processing Frameworks", items: ["Hadoop", "Spark"] },
      { head: "Data Processing Techniques", items: ["Parallel Processing", "MPI", "MapReduce"] }] } },
  { kind: "node", text: "Deep Learning (Optional)",
    right: { kind: "group", sections: [
      { head: "Learn the Basics", items: ["Neural Networks", "CNNs", "RNN"] },
      { head: "Frameworks", items: ["PyTorch", "TensorFlow"] },
      { head: "Practice Training Models", items: ["Image Recognition", "NLP"] }] } },
];
