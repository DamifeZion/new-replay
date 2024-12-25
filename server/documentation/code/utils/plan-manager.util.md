# Plan Manager Utility

A utility to manage subscription plans should:

1. Define Plans and Features:

   - Store plans and features as a configuration.

2. Validate User Access:

   - Check if a user’s plan supports a requested feature.

3. Upgrade/Downgrade Plans:
   - Provide logic for switching between plans.

## Implementation Example

### Plan Configurations

```bash
   const plans = {
      free: {
         cost: 0,
         features: {
            accessLibrary: "limited",
            videoQuality: "SD",
            simultaneousStreams: 1,
            ads: true,
            offlineDownloads: false,
            exclusiveContent: false,
            watchParty: false,
            parentalControls: false,
         },
      },
      basic: {
         cost: 8,
         features: {
            accessLibrary: "full",
            videoQuality: "SD",
            simultaneousStreams: 1,
            ads: false,
            offlineDownloads: false,
            exclusiveContent: false,
            watchParty: false,
            parentalControls: false,
         },
      },
      standard: {
         cost: 12,
         features: {
            accessLibrary: "full",
            videoQuality: "HD",
            simultaneousStreams: 2,
            ads: false,
            offlineDownloads: true,
            exclusiveContent: false,
            watchParty: true,
            parentalControls: false,
         },
      },
      premium: {
         cost: 18,
         features: {
            accessLibrary: "full",
            videoQuality: "4K",
            simultaneousStreams: 4,
            ads: false,
            offlineDownloads: true,
            exclusiveContent: true,
            watchParty: true,
            parentalControls: true,
         },
      },
      family: {
         cost: 25,
         features: {
            accessLibrary: "full",
            videoQuality: "4K",
            simultaneousStreams: 6,
            ads: false,
            offlineDownloads: true,
            exclusiveContent: true,
            watchParty: true,
            parentalControls: true,
         },
      },
   };
```

## Usage in controller

1. Get Plan Details:

```bash
   const userPlan = planManager.getPlan("premium");
   console.log(userPlan);
```

2. Check Feature Access:

```bash
   const canDownload = planManager.canAccessFeature("basic", "offlineDownloads");
   console.log("Offline Downloads:", canDownload);
```

3. Upgrade Plan:

```bash
   await planManager.changePlan(userId, "premium");
   console.log("Plan upgraded successfully");
```
