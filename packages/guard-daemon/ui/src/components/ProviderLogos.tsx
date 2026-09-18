import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const OpenAILogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    className={`${className} shrink-0`}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4072-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
  </svg>
);

export const AnthropicLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <div
    style={{ width: size, height: size }}
    className={`${size ? '' : className} rounded-full bg-[#D97757] flex items-center justify-center text-white shrink-0 overflow-hidden`}
  >
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.827 3.5h3.69L24 20.5h-3.69l-1.92-4.47H9.61l-1.92 4.47H4l6.483-15h3.344zm3.033 9.77L14.73 7.82h-.24l-2.13 5.45h4.5zM3.483 18.06l3.197-7.4 1.77 4.12-2.187 5.08H3.483z" />
    </svg>
  </div>
);

export const GoogleLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    className={`${className} shrink-0`}
    viewBox="0 0 24 24"
  >
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export const DeepSeekLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <div
    style={{ width: size, height: size }}
    className={`${size ? '' : className} rounded-full bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-2xs`}
  >
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.4.95 4.58 2.5 6.19l1.41-1.41C5.66 15.47 5 13.82 5 12c0-3.86 3.14-7 7-7s7 3.14 7 7c0 1.82-.66 3.47-1.91 4.78l1.41 1.41C20.05 16.58 21 14.4 21 12c0-4.97-4.03-9-9-9zm-1 5v8l6-4-6-4z"/>
    </svg>
  </div>
);

export const GrokLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <div
    style={{ width: size, height: size }}
    className={`${size ? '' : className} rounded-full bg-black flex items-center justify-center text-white shrink-0`}
  >
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  </div>
);

export const KimiLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <div
    style={{ width: size, height: size }}
    className={`${size ? '' : className} rounded-full bg-[#1A1A1A] flex items-center justify-center text-white shrink-0`}
  >
    <span className="text-[10px] font-bold font-mono tracking-tighter leading-none">K</span>
  </div>
);

export const QwenLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <div
    style={{ width: size, height: size }}
    className={`${size ? '' : className} rounded-full bg-[#624AFF] flex items-center justify-center text-white shrink-0`}
  >
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  </div>
);

export const GLMLogo: React.FC<LogoProps> = ({ className = 'w-4 h-4', size }) => (
  <div
    style={{ width: size, height: size }}
    className={`${size ? '' : className} rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0`}
  >
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L2 9l10 6 10-6-10-6zm0 18l-10-6 1.8-1.08L12 18.72l8.2-4.8L22 15l-10 6z"/>
    </svg>
  </div>
);

export const ProviderIcon: React.FC<{ provider: string; className?: string }> = ({
  provider,
  className = 'w-4 h-4',
}) => {
  const norm = provider.toLowerCase();
  if (norm.includes('openai') || norm.includes('gpt') || norm.includes('o1')) {
    return <OpenAILogo className={className} />;
  }
  if (norm.includes('anthropic') || norm.includes('claude')) {
    return <AnthropicLogo className={className} />;
  }
  if (norm.includes('google') || norm.includes('gemini')) {
    return <GoogleLogo className={className} />;
  }
  if (norm.includes('deepseek')) {
    return <DeepSeekLogo className={className} />;
  }
  if (norm.includes('grok') || norm.includes('xai')) {
    return <GrokLogo className={className} />;
  }
  if (norm.includes('kimi') || norm.includes('moonshot')) {
    return <KimiLogo className={className} />;
  }
  if (norm.includes('qwen') || norm.includes('alibaba')) {
    return <QwenLogo className={className} />;
  }
  if (norm.includes('glm') || norm.includes('zhipu')) {
    return <GLMLogo className={className} />;
  }

  // Fallback
  return (
    <div className={`${className} rounded-full bg-[#0C2419] flex items-center justify-center text-white shrink-0 text-[9px] font-bold`}>
      {provider.slice(0, 1).toUpperCase()}
    </div>
  );
};
