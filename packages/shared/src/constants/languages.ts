/**
 * Language Detection Constants
 */

export const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  JavaScript: ['.js', '.jsx', '.mjs'],
  TypeScript: ['.ts', '.tsx'],
  Python: ['.py', '.pyw'],
  Java: ['.java'],
  Go: ['.go'],
  Rust: ['.rs'],
  C: ['.c', '.h'],
  'C++': ['.cpp', '.hpp', '.cc', '.cxx'],
  'C#': ['.cs'],
  Ruby: ['.rb'],
  PHP: ['.php'],
  Swift: ['.swift'],
  Kotlin: ['.kt', '.kts'],
  HTML: ['.html', '.htm'],
  CSS: ['.css', '.scss', '.sass', '.less'],
  SQL: ['.sql'],
  Shell: ['.sh', '.bash'],
};

export const FRAMEWORK_INDICATORS: Record<string, string[]> = {
  React: ['react', '@types/react'],
  'Next.js': ['next'],
  Vue: ['vue'],
  Angular: ['@angular/core'],
  Express: ['express'],
  NestJS: ['@nestjs/core'],
  Django: ['Django'],
  Flask: ['Flask'],
  'Spring Boot': ['spring-boot'],
  FastAPI: ['fastapi'],
  Svelte: ['svelte'],
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_EXTENSIONS);
