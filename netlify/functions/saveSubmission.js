import { Octokit } from "@octokit/rest";

export const handler = async (event, context) => {
  try {
    const payload = JSON.parse(event.body);
    const formData = payload.payload.data;
    const submittedAt = payload.payload.created_at || new Date().toISOString();

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const OWNER = process.env.GITHUB_OWNER;
    const REPO  = process.env.GITHUB_REPO;

    const now = new Date(submittedAt).toISOString().replace(/[:.]/g, "-");
    const filePath = `submissions/${now}.json`;

    const jsonContent = {
      ...formData,
      submittedAt: submittedAt
    };
    const contentBase64 = Buffer.from(JSON.stringify(jsonContent, null, 2)).toString("base64");

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      message: `New submission at ${now}`,
      content: contentBase64,
      committer: {
        name: "Netlify Bot",
        email: "netlify-bot@example.com"
      },
      author: {
        name: formData["주는이_이름"] || "anonymous",
        email: formData["주는이_이메일"] || "anonymous@example.com"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("Error saving to GitHub:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
