using System;
using System.IO;
using System.Net;


namespace LinkedInScanPost
{
    class Program
    {
        static void Main()
        {
            //var client = new LinkedInClient("75548prrx707qw", "lPdKFKUaXpTS8Xx0");

            
            //client.GetAuthorizationUrl()

            //var token = client.GetAccessToken("8222374f-bd51-4e04-ad8b-478f9697fd57", "www.townbreath.com");
            //client.CurrentUser.ApiStandardProfileRquest.

            //var groupOpt = new LinkedInGetGroupOptions();
            //groupOpt.GroupOptions.Clear();
            //groupOpt.GroupOptions[LinkedInGroupFields.Id] = true;
            //groupOpt.GroupOptions[LinkedInGroupFields.Name] = true;

            //var groups = client.GetMemberGroups (groupOpt);

            var browser = new WebClient();
            var stream = browser.OpenRead("http://www.townbreath.com/test.html");
            if (stream != null)
            {
                var sr = new StreamReader(stream);
                var page = sr.ReadToEnd();
                Console.WriteLine(page);
            }


            //var opt = new LinkedInGetGroupPostsOptions {}
            //var posts = client.GetGroupPosts( )
        }
    }
}
