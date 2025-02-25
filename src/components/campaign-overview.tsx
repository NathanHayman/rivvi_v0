import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Campaign } from "@/server/db/schema";
import { Badge } from "./ui/badge";

const CampaignOverview = ({
  campaign,
  children,
  className,
}: {
  campaign: Campaign;
  children: React.ReactNode;
  className?: string;
}) => {
  const { name, agentId, enabled, config } = campaign;
  const { variables, postCall } = config ?? {};
  const { campaign: campaignFields } = variables ?? {};
  const { campaign: postCallFields } = postCall ?? {};

  const campaignFieldsList = campaignFields?.fields.map((field) => field.label);
  const postCallFieldsList = postCallFields?.fields.map((field) => field.label);

  return (
    <Card
      className={cn(
        "shadow-sm rounded-xl bg-card dark:bg-zinc-900/60 border h-fit lg:sticky top-20",
        className
      )}
    >
      <CardHeader className="relative w-full">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{agentId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="">
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
          <Badge variant="outline">
            {agentId ? "Agent Connected" : "Agent Not Connected"}
          </Badge>
        </div>
        <div className="flex flex-col space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground font-medium">
              Campaign Fields
            </p>
            <p className="text-sm text-muted-foreground">
              {campaignFieldsList?.join(", ")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground font-medium">
              Post Call Fields
            </p>
            <p className="text-sm text-muted-foreground">
              {postCallFieldsList?.join(", ")}
            </p>
          </div>
        </div>
      </CardContent>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
};

export default CampaignOverview;
