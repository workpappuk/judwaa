import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type { NocodeComponent, NocodeField, NocodePage, NocodeTheme } from "./types";

const inputTypeFromField = (fieldType: NocodeField["type"]): "text" | "email" | "number" | "date" => {
  if (fieldType === "email") {
    return "email";
  }

  if (fieldType === "number") {
    return "number";
  }

  if (fieldType === "date") {
    return "date";
  }

  return "text";
};

const renderFormField = (field: NocodeField) => {
  if (field.type === "textarea") {
    return (
      <Grid key={field.id} size={{ xs: 12, md: 6 }}>
        <TextField
          id={field.id}
          name={field.name}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          multiline
          minRows={4}
          fullWidth
        />
      </Grid>
    );
  }

  if (field.type === "select") {
    return (
      <Grid key={field.id} size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <Typography variant="caption" sx={{ mb: 0.8, fontWeight: 600, color: "text.secondary" }}>
            {field.label}
            {field.required ? " *" : ""}
          </Typography>
          <Select id={field.id} name={field.name} required={field.required} defaultValue={field.defaultValue ?? ""} displayEmpty>
            <MenuItem value="" disabled>
              Select {field.label}
            </MenuItem>
            {(field.options ?? []).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    );
  }

  return (
    <Grid key={field.id} size={{ xs: 12, md: 6 }}>
      <TextField
        id={field.id}
        name={field.name}
        type={inputTypeFromField(field.type)}
        label={field.label}
        required={field.required}
        placeholder={field.placeholder}
        defaultValue={field.defaultValue}
        fullWidth
      />
    </Grid>
  );
};

const renderComponent = (component: NocodeComponent) => {
  if (component.type === "heading") {
    return <Typography variant="h5" sx={{ fontWeight: 800 }}>{component.content}</Typography>;
  }

  if (component.type === "paragraph") {
    return <Typography variant="body2" sx={{ lineHeight: 1.8, color: "text.secondary" }}>{component.content}</Typography>;
  }

  if (component.type === "stats") {
    return (
      <Grid container spacing={2}>
        {(component.stats ?? []).map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                {stat.value}
              </Typography>
              {stat.delta ? <Typography variant="caption" sx={{ color: "success.main" }}>{stat.delta}</Typography> : null}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (component.type === "table") {
    const columns = component.columns ?? [];
    const rows = component.rows ?? [];

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ fontWeight: 700 }}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${index}-${columns[0] ?? "row"}`}>
                {columns.map((column) => (
                  <TableCell key={`${index}-${column}`}>{row[column] ?? "-"}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (component.type === "form") {
    return (
      <Box component="form" action="#" method="post" sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
        <Grid container spacing={2}>
          {(component.fields ?? []).map((field) => renderFormField(field))}
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit Metadata Form
        </Button>
      </Box>
    );
  }

  return null;
};

export const RuntimePage = ({ page, theme }: { page: NocodePage; theme: NocodeTheme }) => {
  return (
    <Box sx={{ minHeight: "calc(100vh - 7rem)", borderRadius: 2, p: 1.5, bgcolor: theme.soft }}>
      <Box sx={{ mx: "auto", maxWidth: 1200, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "rgba(var(--mui-palette-background-paperChannel) / 0.9)" }}>
          <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>
            Runtime Rendered Page
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: theme.brand }}>
            {page.title}
          </Typography>
          {page.description ? <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>{page.description}</Typography> : null}
        </Paper>

        {page.sections.map((section) => (
          <Paper key={section.id} variant="outlined" sx={{ p: 2.5, bgcolor: "rgba(var(--mui-palette-background-paperChannel) / 0.88)" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.brand }}>{section.title}</Typography>
            {section.description ? <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary" }}>{section.description}</Typography> : null}
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              {section.components.map((component) => (
                <Box key={component.id}>{renderComponent(component)}</Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
