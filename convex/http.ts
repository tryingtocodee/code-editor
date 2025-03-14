import { httpRouter } from "convex/server";
import {httpAction} from "./_generated/server"
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import {api} from "./_generated/api"

const http = httpRouter()

http.route({
    path: "/clerk-webhook", //this is the path created in clerk/webhook 
    method : "POST",

    handler : httpAction( async(ctx , request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET  // CLERK_WEBHOOK_SECRET is coming from env variable created in convex . 
 
        if(!webhookSecret){
            throw new Error("missign CLERK_WEBHOOK_SECRET env variable ")
        }

        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if(!svix_signature || !svix_id || !svix_timestamp){
            return new Response("error occured -- no svix headers provided" , {
                status : 400 ,
            })
        }

        const payload = await request.json();
        const body = JSON.stringify(payload);

        const wh = new Webhook(webhookSecret);
        let evt : WebhookEvent

        try {
            evt = wh.verify(body , {
                "svix-id": svix_id,
                "svix-signature" : svix_signature,
                "svix-timestamp":svix_timestamp
            })as WebhookEvent
        } catch (e ) {
            console.log("error verifying webhook :  " , e)
            return new Response("error occured" , {status : 400})
        }

        const eventType = evt.type;

        if(eventType === "user.created"){
            //save user to convex db 

            const {id , email_addresses , first_name , last_name} = evt.data;

            const email = email_addresses[0].email_address; // user might have multiple email . get the primary / first email 
            const name = `${first_name || ""} ${last_name || ""}`.trim()
            
            try {
                // save user to db 
                await ctx.runMutation(api.users.syncUser , {
                    userId : id,
                    email ,
                    name
                })
            } catch (e) {
                console.log("error creating user check try catch after eventtype declaration" , e )
                return new Response ("Error creating user" , {status : 500})
            }
        }

        return new Response("Webhook processed successfully" , {status : 200})
    })
})

export default http;