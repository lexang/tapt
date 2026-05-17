'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';

function handleScrollToWorkbench(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const target = document.getElementById('workbench');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleLoadExample(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const target = document.getElementById('workbench');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Try to click the inline example button if available.
  setTimeout(() => {
    const sourcePanel = document.querySelector('section.source-panel');
    if (!sourcePanel) {
      return;
    }
    const buttons = sourcePanel.querySelectorAll<HTMLButtonElement>('button');
    for (const button of buttons) {
      if (button.textContent?.trim() === '示例') {
        button.click();
        return;
      }
    }
  }, 320);
}

export function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="hero-eyebrow">在线 · 免费 · 浏览器本地</span>
        <h1 id="hero-title" className="hero-title">
          把表格数据，
          <br />
          <span className="hero-title-accent">搬到你需要的地方。</span>
        </h1>
        <p className="hero-subtitle">
          粘贴 / 拖拽 / 上传，6 种主流表格格式互转。数据从未离开你的浏览器。
        </p>
        <div className="hero-actions">
          <Link
            href="#workbench"
            className="hero-cta hero-cta-primary"
            onClick={handleScrollToWorkbench}
          >
            立即开始
          </Link>
          <Link
            href="#workbench"
            className="hero-cta hero-cta-secondary"
            onClick={handleLoadExample}
          >
            看示例
          </Link>
        </div>
        <div className="hero-trust" aria-hidden="true">
          <span>无需注册</span>
          <span>完全免费</span>
          <span>本地处理</span>
        </div>
      </div>

      <div className="hero-screenshot-wrap" aria-hidden="true">
        <div className="hero-screenshot">
          <div className="hero-screenshot-titlebar">
            <span className="hero-screenshot-dots">
              <span />
              <span />
              <span />
            </span>
            <strong>csv → json</strong>
          </div>
          <div className="hero-screenshot-body">
            <div className="hero-screenshot-table">
              <span className="head">name</span>
              <span className="head">age</span>
              <span className="head">role</span>
              <span>Ada</span>
              <span>36</span>
              <span>Engineer</span>
              <span>Lin</span>
              <span>30</span>
              <span>Designer</span>
              <span>Sam</span>
              <span>27</span>
              <span>Product</span>
              <span>Ji</span>
              <span>42</span>
              <span>Manager</span>
            </div>
            <pre className="hero-screenshot-code">
{`[
  { "name": "Ada", "age": 36, "role": "Engineer" },
  { "name": "Lin", "age": 30, "role": "Designer" }
]`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
