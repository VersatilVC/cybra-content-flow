# Cyabra Content Flow - MCP Configuration

This directory contains Model Context Protocol (MCP) configuration for project-specific database access.

## Supabase MCP Setup

### Project Details
- **Project Ref**: `agbcslwigqthrlxnqbmc`
- **Supabase URL**: `https://agbcslwigqthrlxnqbmc.supabase.co`
- **Environment**: Production

### Setup Instructions

1. **Install Supabase MCP Server**:
   ```bash
   npm install -g supabase-mcp
   ```

2. **Get Service Role Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key)
   - ✅ Already configured in `mcp-config.json`

3. **Configuration Complete**:
   - ✅ Service role key configured
   - ✅ Project URL configured
   - ✅ MCP server package installed

4. **Activate MCP**:
   - The configuration file is ready at `.claude/mcp-config.json`
   - Copy this configuration to your Claude Code settings
   - Or configure in your IDE's MCP settings

### Testing the Connection

To verify the MCP server works:
```bash
# Set environment variables and test
export SUPABASE_URL="https://agbcslwigqthrlxnqbmc.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx supabase-mcp
```

### Database Schema Overview

The database includes these main tables:
- `content_ideas` - AI-generated content suggestions
- `content_briefs` - Detailed content specifications
- `content_items` - Final content pieces with derivatives
- `profiles` - User profiles and roles
- `feedback_submissions` - User feedback
- `general_content` - Flexible content creation
- `webhooks` - Integration endpoints

### Security Notes

- ⚠️ **Keep service role key secure** - Do not commit to version control
- ✅ **Use environment variables** for production deployments
- ✅ **Row Level Security (RLS)** is enabled on all tables
- ✅ **Edge functions** handle secure API operations

### Usage

Once configured, Claude Code will have direct access to:
- Query database tables
- Analyze data patterns
- Suggest schema improvements
- Debug data issues
- Generate database reports

This enables more efficient development and debugging for the Cyabra Content Flow platform.