export function SocialProofSection() {
  return (
    <section className="social-proof">
      <p>深受全球超过 10,000+ 开发者与数据分析师信赖的在线转换平台</p>
      <div className="social-proof-logos">
        {/* placeholders for abstract logos representing companies/universities */}
        <svg viewBox="0 0 100 30" fill="currentColor">
          <circle cx="15" cy="15" r="10" />
          <rect x="35" y="10" width="50" height="10" rx="2" />
        </svg>
        <svg viewBox="0 0 100 30" fill="currentColor">
          <polygon points="15,5 25,25 5,25" />
          <rect x="35" y="10" width="50" height="10" rx="2" />
        </svg>
        <svg viewBox="0 0 100 30" fill="currentColor">
          <rect x="5" y="5" width="20" height="20" rx="4" />
          <rect x="35" y="10" width="50" height="10" rx="2" />
        </svg>
        <svg viewBox="0 0 100 30" fill="currentColor">
          <path d="M15,5 L25,15 L15,25 L5,15 Z" />
          <rect x="35" y="10" width="50" height="10" rx="2" />
        </svg>
      </div>
    </section>
  );
}
