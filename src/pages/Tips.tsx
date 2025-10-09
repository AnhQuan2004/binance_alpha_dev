const articles = [
  {
    title: 'ZAMA là gì? Giao thức FHE giúp bảo mật thông tin trên blockchain',
    url: 'https://gfiresearch.net/zama-fhe-la-gi',
    label: 'gfiresearch.net/zama-fhe-la-gi',
  },
  {
    title: 'Tối ưu hóa cơ hội đầu tư trên hệ sinh thái Hyperliquid',
    url: 'https://gfiresearch.net/toi-uu-co-hoi-hyperliquid',
    label: 'gfiresearch.net/toi-uu-co-hoi-hyperliquid',
  },
  {
    title: 'Hiểu rõ cách hoạt động của Proof of Liquidity',
    url: 'https://gfiresearch.net/hieu-ro-ve-proof-of-liquidity-o-berachain',
    label: 'gfiresearch.net/hieu-ro-ve-proof-of-liquidity-o-berachain',
  },
];

const Tips = () => {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Tips</h1>
      <div className="bg-[#1C1C1C] rounded-lg p-4">
        <div className="divide-y divide-border/50">
          {articles.map((tool, index) =>
            true ? (  
              <div key={index} className="py-4">
                <div className="flex items-center mb-2">
                  <h2 className="font-bold text-lg">{tool.title}</h2>
                  <span className="ml-2">{tool.label}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article, idx) => (
                    <a
                      key={idx}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{article.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">🔗</span>
                        <span className="truncate">{article.label}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div key={index} className="py-4">
                <div className="flex items-center">
                  <h2 className="font-bold text-lg">{tool.title}</h2>
                  <span className="ml-2">{tool.label}</span>
                </div>
                <p className="text-subtle-text mt-1">{tool.label}</p>
                {tool.url && (
                  true ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-primary underline"
                    >
                      {tool.label}
                    </a>
                  ) : (
                    <a
                      href={tool.url}
                      className="inline-block mt-2 text-primary underline"
                    >
                      {tool.label}
                    </a>
                  )
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Tips;
