**Run Supabase**

```
bunx supabase <command>

bunx supabase login
```

**Download the function**

For Recording Price

```
bunx supabase functions download gold-price-function
```

For Price Monitoring

```
bunx supabase functions download gold-price-monitoring
```

<br/>

For Daily Summary

```
bunx supabase functions download gold-price-data-summary
```

<br/>

For Weekly Summary

```
bunx supabase functions download gold-price-data-weekly-summary
```

<br/>

**Deploy the function**

For Recording Price

```
bunx supabase functions deploy gold-price-function
```

<br/>

For Price Monitoring

```
bunx supabase functions deploy gold-price-monitoring
```

<br/>

For Daily Summary

```
bunx supabase functions deploy gold-price-data-summary
```

<br/>

For Weekly Summary

```
bunx supabase functions deploy gold-price-data-weekly-summary
```

<br/>

**URL**

Record current price:

```
POST https://gzdjohkzhnewiphyupxz.supabase.co/functions/v1/gold-price-function

Header: Authorization: Bearer <token>

No payload
```

<br />

Monitor price:

```
POST https://gzdjohkzhnewiphyupxz.supabase.co/functions/v1/gold-price-monitoring

Header: Authorization: Bearer <token>

Payload: { "priceThreshold": 100 }

```

<br />

Daily Summary:

```
POST https://gzdjohkzhnewiphyupxz.supabase.co/functions/v1/gold-price-data-summary

Header: Authorization: Bearer <token>

```

<br />

Weekly Summary:

```
POST https://gzdjohkzhnewiphyupxz.supabase.co/functions/v1/gold-price-data-weekly-summary

Header: Authorization: Bearer <token>

```

**Get token**

- Project Settings
- Select Data API
- Copy the token under Project API Keys with the tag <br/>

```
[anon][public]
```
