// 新建文章页面
import AppShell from "@/components/AppShell";
import ArticleEditor from "@/components/ArticleEditor";

export default function NewArticlePage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">新建文章</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <ArticleEditor />
        </div>
      </div>
    </AppShell>
  );
}
