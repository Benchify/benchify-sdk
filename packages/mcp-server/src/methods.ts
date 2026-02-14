// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { McpOptions } from './options';

export type SdkMethod = {
  clientCallName: string;
  fullyQualifiedName: string;
  httpMethod?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'query';
  httpPath?: string;
};

export const sdkMethods: SdkMethod[] = [
  {
    clientCallName: 'client.fixer.run',
    fullyQualifiedName: 'fixer.run',
    httpMethod: 'post',
    httpPath: '/v1/fixer',
  },
  {
    clientCallName: 'client.stacks.create',
    fullyQualifiedName: 'stacks.create',
    httpMethod: 'post',
    httpPath: '/v1/stacks',
  },
  {
    clientCallName: 'client.stacks.retrieve',
    fullyQualifiedName: 'stacks.retrieve',
    httpMethod: 'get',
    httpPath: '/v1/stacks/{id}',
  },
  {
    clientCallName: 'client.stacks.update',
    fullyQualifiedName: 'stacks.update',
    httpMethod: 'post',
    httpPath: '/v1/stacks/{id}/patch',
  },
  {
    clientCallName: 'client.stacks.bundleMultipart',
    fullyQualifiedName: 'stacks.bundleMultipart',
    httpMethod: 'post',
    httpPath: '/v1/stacks/bundle-multipart',
  },
  {
    clientCallName: 'client.stacks.destroy',
    fullyQualifiedName: 'stacks.destroy',
    httpMethod: 'delete',
    httpPath: '/v1/stacks/{id}',
  },
  {
    clientCallName: 'client.stacks.executeCommand',
    fullyQualifiedName: 'stacks.executeCommand',
    httpMethod: 'post',
    httpPath: '/v1/stacks/{id}/exec',
  },
  {
    clientCallName: 'client.stacks.getLogs',
    fullyQualifiedName: 'stacks.getLogs',
    httpMethod: 'get',
    httpPath: '/v1/stacks/{id}/logs',
  },
  {
    clientCallName: 'client.stacks.getNetworkInfo',
    fullyQualifiedName: 'stacks.getNetworkInfo',
    httpMethod: 'get',
    httpPath: '/v1/stacks/{id}/network-info',
  },
  {
    clientCallName: 'client.stacks.readFile',
    fullyQualifiedName: 'stacks.readFile',
    httpMethod: 'get',
    httpPath: '/v1/stacks/{id}/read-file',
  },
  {
    clientCallName: 'client.stacks.reset',
    fullyQualifiedName: 'stacks.reset',
    httpMethod: 'post',
    httpPath: '/v1/stacks/{id}/reset',
  },
  {
    clientCallName: 'client.stacks.waitForDevServerURL',
    fullyQualifiedName: 'stacks.waitForDevServerURL',
    httpMethod: 'get',
    httpPath: '/v1/stacks/{id}/wait-url',
  },
  {
    clientCallName: 'client.stacks.writeFile',
    fullyQualifiedName: 'stacks.writeFile',
    httpMethod: 'post',
    httpPath: '/v1/stacks/{id}/write-file',
  },
  {
    clientCallName: 'client.fixStringLiterals.create',
    fullyQualifiedName: 'fixStringLiterals.create',
    httpMethod: 'post',
    httpPath: '/v1/fix-string-literals',
  },
  {
    clientCallName: 'client.validateTemplate.validate',
    fullyQualifiedName: 'validateTemplate.validate',
    httpMethod: 'post',
    httpPath: '/v1/validate-template',
  },
  {
    clientCallName: 'client.fixParsingAndDiagnose.detectIssues',
    fullyQualifiedName: 'fixParsingAndDiagnose.detectIssues',
    httpMethod: 'post',
    httpPath: '/v1/fix-parsing-and-diagnose',
  },
  {
    clientCallName: 'client.fix.createAIFallback',
    fullyQualifiedName: 'fix.createAIFallback',
    httpMethod: 'post',
    httpPath: '/v1/fix/ai-fallback',
  },
  {
    clientCallName: 'client.fix.standard.create',
    fullyQualifiedName: 'fix.standard.create',
    httpMethod: 'post',
    httpPath: '/v1/fix-standard',
  },
];

function allowedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  if (!options) {
    return undefined;
  }

  let allowedMethods: SdkMethod[];

  if (options.codeAllowHttpGets || options.codeAllowedMethods) {
    // Start with nothing allowed and then add into it from options
    let allowedMethodsSet = new Set<SdkMethod>();

    if (options.codeAllowHttpGets) {
      // Add all methods that map to an HTTP GET
      sdkMethods
        .filter((method) => method.httpMethod === 'get')
        .forEach((method) => allowedMethodsSet.add(method));
    }

    if (options.codeAllowedMethods) {
      // Add all methods that match any of the allowed regexps
      const allowedRegexps = options.codeAllowedMethods.map((pattern) => {
        try {
          return new RegExp(pattern);
        } catch (e) {
          throw new Error(
            `Invalid regex pattern for allowed method: "${pattern}": ${e instanceof Error ? e.message : e}`,
          );
        }
      });

      sdkMethods
        .filter((method) => allowedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)))
        .forEach((method) => allowedMethodsSet.add(method));
    }

    allowedMethods = Array.from(allowedMethodsSet);
  } else {
    // Start with everything allowed
    allowedMethods = [...sdkMethods];
  }

  if (options.codeBlockedMethods) {
    // Filter down based on blocked regexps
    const blockedRegexps = options.codeBlockedMethods.map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch (e) {
        throw new Error(
          `Invalid regex pattern for blocked method: "${pattern}": ${e instanceof Error ? e.message : e}`,
        );
      }
    });

    allowedMethods = allowedMethods.filter(
      (method) => !blockedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)),
    );
  }

  return allowedMethods;
}

export function blockedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  const allowedMethods = allowedMethodsForCodeTool(options);
  if (!allowedMethods) {
    return undefined;
  }

  const allowedSet = new Set(allowedMethods.map((method) => method.fullyQualifiedName));

  // Return any methods that are not explicitly allowed
  return sdkMethods.filter((method) => !allowedSet.has(method.fullyQualifiedName));
}
