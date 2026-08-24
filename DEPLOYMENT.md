# Deployment Guide

## Pre-Deployment Checklist

✅ **All calculation fixes completed:**
- Student loan calculations implemented
- PAYE calculator updated with student loan support
- Umbrella calculator updated with student loan support
- Limited company calculator fixed (PAYE on director salary + dividend tax)
- UI components updated to display student loans
- All TypeScript types updated

## Build & Deploy

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Build the project**:
   ```bash
   cd payroll-mvp
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

   Or use the Vercel dashboard:
   - Push code to GitHub
   - Connect repository to Vercel
   - Automatic deployments on push

### Option 2: Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Deploy the .next folder or use Netlify CLI
netlify deploy --prod
```

#### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Server
```bash
npm run build
npm start
# Runs on port 3000 by default
```

## Post-Deployment Verification

After deployment, verify:

1. **Student Loans**: 
   - Go to PAYE tab
   - Select a student loan plan
   - Verify student loan amount is calculated and displayed

2. **Limited Company**:
   - Go to Limited tab or Combined tab
   - Verify director salary shows PAYE breakdown
   - Verify dividend tax is calculated correctly
   - Verify net salary + net dividends = net to director

3. **Umbrella**:
   - Go to Umbrella tab
   - Verify student loans are applied
   - Verify PAYE breakdown is shown

4. **Combined Income**:
   - Go to Combined tab
   - Verify all calculators show student loans
   - Verify calculations are accurate

## Environment Variables

No environment variables required for this deployment.

## Build Configuration

- **Node.js**: 20.x or higher
- **Next.js**: 16.2.0
- **TypeScript**: 5.x
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Output Directory**: `.next`

## Recent Changes in This Deployment

### Calculation Fixes
1. ✅ Student loan calculations properly implemented
2. ✅ Limited company director salary now applies PAYE tax/NI
3. ✅ Dividend tax calculation fixed with proper band allocation
4. ✅ Student loans integrated into all calculators
5. ✅ UI updated to display student loan amounts

### Type Updates
- `CombinedPayeInput` now includes `loans?: LoanKey[]`
- `CombinedPayeOutput` now includes `totalStudentLoans: number`
- `UmbrellaInput` now includes `loans?: LoanKey[]`
- `LimitedInput` now includes `loans?: LoanKey[]`, `taxCode?: string`, `salarySacrificePct?: number`, etc.
- `calcLimited` return type now includes `paye`, `dividendTax`, `netSalary`

## Testing

Run test scenarios (optional):
```bash
# In browser console or Node.js
import { runAllScenarios } from '@/lib/calculators/__tests__/example-scenarios';
runAllScenarios();
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear `.next` folder: `rm -rf .next` (Linux/Mac) or `rmdir /s .next` (Windows)
- Rebuild: `npm run build`

### TypeScript Errors
- Run type check: `npx tsc --noEmit`
- Verify all imports are correct

### Runtime Errors
- Check browser console for errors
- Verify all calculator functions are imported correctly
- Check that UK_TAX_2025 constants are correct

## Support

For issues or questions:
1. Check the calculation logic in `src/lib/calculators/`
2. Verify UK tax rates in `src/lib/tax/uk2025.ts`
3. Test with example scenarios in `src/lib/calculators/__tests__/example-scenarios.ts`

