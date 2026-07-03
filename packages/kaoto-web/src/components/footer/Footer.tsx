import { AspectRatio, Column, Grid } from '@carbon/react';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Grid as="footer" className="cs--footer">
      <Column sm={4} md={8} lg={8}>
        <AspectRatio ratio="16x9">
          <p>Footer</p>
          <p>Copyright IBM {year}</p>
        </AspectRatio>
      </Column>
    </Grid>
  );
};
